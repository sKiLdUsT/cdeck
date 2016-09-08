@extends('base')
@section('content')
    <div class="container center white">
        <h4 class='header center'>Changelog</h4>
        <ul class='collapsible' data-collapsible='expandable'>
            <li>
                <div class='collapsible-header'><i class='material-icons'>view_list</i>Git History:</div>
                <div class='collapsible-body'>
                    <p><table class='bordered highlight'>
                        <thead>
                        <tr>
                            <th data-field='time'>Date</th>
                            <th data-field='name'>Comitted by</th>
                            <th data-field='topic'>Commit Message</th>
                        </tr>
                        </thead>
                        @foreach(array_slice($log, 0, 20) as $input)
                        <tbody>
                        <tr>
                            <td>{{isset($input["date"]) ? $input["date"] : ""}}</td>
                            <td>{{isset($input["author"]) ? $input["author"] : ""}}</td>
                            <td>{{isset($input["message"]) ? $input["message"] : ""}}</td>
                        </tr>
                        @endforeach
                        </tbody>
                    </table>
                    </p>
                </div>
            </li>
        </ul>
        <br>
        </div>
@endsection